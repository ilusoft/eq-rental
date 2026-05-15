import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader,
      },
    })

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const user = await userResponse.json()

    const { equipment_id, start_date, end_date, pickup_location, dropoff_location, notes } = await req.json()

    if (!equipment_id || !start_date || !end_date || !pickup_location) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const equipmentResponse = await fetch(
      `${supabaseUrl}/rest/v1/equipment?id=eq.${equipment_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const equipmentData = await equipmentResponse.json()

    if (!equipmentData || equipmentData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Equipment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const equipment = equipmentData[0]

    if (equipment.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Equipment not available for booking' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)
    const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (days < equipment.min_rental_days) {
      return new Response(
        JSON.stringify({ error: `Minimum rental is ${equipment.min_rental_days} days` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/bookings?equipment_id=eq.${equipment_id}&status=in.(pending,confirmed,active)&start_date=lte.${end_date}&end_date=gte.${start_date}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const existingBookings = await checkResponse.json()

    if (existingBookings && existingBookings.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Equipment already booked for these dates' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let totalPrice: number
    if (days >= 7 && equipment.weekly_rate) {
      const weeks = Math.floor(days / 7)
      const remainingDays = days % 7
      totalPrice = (weeks * equipment.weekly_rate) + (remainingDays * equipment.daily_rate)
    } else {
      totalPrice = days * equipment.daily_rate
    }

    const bookingResponse = await fetch(
      `${supabaseUrl}/rest/v1/bookings`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          equipment_id,
          renter_id: user.id,
          start_date,
          end_date,
          pickup_location,
          dropoff_location: dropoff_location || null,
          total_price: totalPrice,
          deposit_amount: equipment.deposit_amount,
          deposit_status: 'pending',
          status: 'pending',
          notes: notes || null,
        }),
      }
    )

    if (!bookingResponse.ok) {
      const errorData = await bookingResponse.text()
      return new Response(
        JSON.stringify({ error: errorData }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const booking = await bookingResponse.json()

    return new Response(
      JSON.stringify({ success: true, booking: booking[0] }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})