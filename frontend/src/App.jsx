import { useEffect, useState } from 'react'
import './App.css'
import socket from './lib/socket'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function App() {

  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(false)


  const handleToggle = (id, checked, setter) => {
    setter(checked)
    socket.emit('toggle-changed', { id, checked })
  }

  useEffect(() => {
    // Listen for broadcasts from server
    socket.on('toggle-changed', (data) => {
      const toggleId = data['id'];
      const toggleState = data['checked'];

      if (toggleId == 'toggle-1') {
        setToggle1(toggleState)
      } else if (toggleId == 'toggle-2') {
        setToggle2(toggleState)
      }
    });

    return () => socket.off('broadcast')
  }, [])

  return (
    <header>
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />

        <div className="toggle-container">
          <h2>Toggle buttons:</h2>

          <label htmlFor="toggle-1" className="toggle-label">
            <input type='checkbox' id="toggle-1" className={`toggle-input`} checked={toggle1} onChange={(e) => handleToggle('toggle-1', e.target.checked, setToggle1)} />
            <div className='toggle-switch'></div>
            <span className='toggle-text'>Toggle Me 1</span>
          </label>

          <label htmlFor="toggle-2" className="toggle-label">
            <input type='checkbox' id="toggle-2" className={`toggle-input`} checked={toggle2} onChange={(e) => handleToggle('toggle-2', e.target.checked, setToggle2)} />
            <div className='toggle-switch'></div>
            <span className='toggle-text'>Toggle Me 2</span>
          </label>

        </div>
      </Show>
    </header>
  )
}

export default App
