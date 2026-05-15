import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req: Request) => {
  try {
    const { equipment_id, start_date, end_date } = await req.json()

    if (!equipment_id || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)

    const response = await fetch(
      `${supabaseUrl}/rest/v1/bookings?equipment_id=eq.${equipment_id}&status=in.(pending,confirmed,active)&start_date=lte.${end_date}&end_date=gte.${start_date}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const bookings = await response.json()

    if (bookings && bookings.length > 0) {
      return new Response(
        JSON.stringify({ available: false, reason: 'Equipment already booked for these dates' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const availabilityResponse = await fetch(
      `${supabaseUrl}/rest/v1/equipment_availability?equipment_id=eq.${equipment_id}&start_date=lte.${end_date}&end_date=gte.${start_date}&is_available=eq.false`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const unavailableDates = await availabilityResponse.json()

    if (unavailableDates && unavailableDates.length > 0) {
      return new Response(
        JSON.stringify({ available: false, reason: 'Equipment marked unavailable for these dates' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ available: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})