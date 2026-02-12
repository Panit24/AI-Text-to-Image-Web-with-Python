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
