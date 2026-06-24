import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          schools (*)
        `)

      if (error) {
        console.error('Error fetching profiles:', error)
        return
      }

      console.log('Profiles:', data)
      setProfiles(data)
    }

    fetchProfiles()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-medium mb-4">Admissions Simulator</h1>
      <p className="text-gray-500">Profiles loaded: {profiles.length}</p>
    </div>
  )
}

export default App