// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import ImageGenerator from './components/ImageGenerator';

function App() {
  return (
    <div className='flex w-screen items-center justify-center'>
     <div className="flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
        <div className="w-full px-2 py-8">
          <header className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <span className="text-6xl">🎨</span>
              AI Text-to-Image Generator
            </h1>
            <p className="text-gray-600 text-lg">
              Transform your words into image
            </p>
            <p>Using Stable Diffusion v1.5 by Runway ML</p>
          </header>
          <div className='flex justify-center items-center'>
           <ImageGenerator />
          </div>
        </div>
     </div>
    </div>
  );
}

export default App;
