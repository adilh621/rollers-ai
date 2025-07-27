'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Components/Header';
import { supabase } from '../../lib/supabaseClient';

export default function HomePage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [params, setParams] = useState({
    time: 'daytime',
    setting: 'city skyline',
    ambiance: 'calm',
    lighting: 'natural lighting'
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const file = e.target.files?.[0];
    const allowedTypes = ['image/png', 'image/jpeg'];

    if (file && allowedTypes.includes(file.type)) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResultImage(null);
    } else {
      alert('Only PNG or JPEG images are allowed');
    }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Please upload an image');
      return;
    }

    setLoading(true);
    setProgress(0);
    let fakeProgress = 0;

    const progressInterval = setInterval(() => {
      fakeProgress += Math.floor(Math.random() * 3) + 2; // 2–4% increments
      if (fakeProgress >= 90) fakeProgress = 90;
      setProgress(fakeProgress);
    }, 1000); // slower updates every 1 second

    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `user_uploads/${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('uploadsrollers')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw new Error(`Upload failed: ${error.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('uploadsrollers')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-image/`, {
        image_url: imageUrl,
        ...params
      });

      const base64Data = res.data.image;
      const imgUrl = `data:image/png;base64,${base64Data}`;
      setResultImage(imgUrl);
    } catch (err) {
      alert('Failed to generate image: ' + (err.response?.data?.error || err.message));
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setProgress(0), 1500);
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl text-white font-semibold mb-4">Please sign in to upload</h2>
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: 'google' });
                setShowLoginModal(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-4 block text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center pt-28 px-6 pb-12">
        <h1 className="text-4xl font-bold mb-6 text-center">Generate AI Rolling Shots of Your Car</h1>

        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 mb-6">
          <label
            className={`${
              loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white cursor-pointer'
            } font-semibold py-2 px-4 rounded inline-block`}
          >
            Upload Image
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={loading ? undefined : handleImageChange}
              disabled={loading}
              className="hidden"
            />
          </label>

          <select name="time" value={params.time} onChange={handleParamChange} className="p-2 text-white rounded bg-gray-800">
            <option value="daytime">Daytime</option>
            <option value="sunset">Sunset</option>
            <option value="sunrise">Sunrise</option>
            <option value="nighttime">Nighttime</option>
          </select>

          <select name="setting" value={params.setting} onChange={handleParamChange} className="p-2 text-white rounded bg-gray-800">
            <option value="city skyline">City Skyline</option>
            <option value="mountains">Mountains</option>
            <option value="canyon">Canyon</option>
            <option value="grassland">Grassland</option>
            <option value="forest/trees">Forest / Trees</option>
          </select>

          <select name="ambiance" value={params.ambiance} onChange={handleParamChange} className="p-2 text-white rounded bg-gray-800">
            <option value="calm">Calm</option>
            <option value="cinematic">Cinematic</option>
            <option value="moody">Moody</option>
            <option value="dreamy">Dreamy</option>
            <option value="intense">Intense</option>
          </select>

          <select name="lighting" value={params.lighting} onChange={handleParamChange} className="p-2 text-white rounded bg-gray-800">
            <option value="natural lighting">Natural Lighting</option>
            <option value="soft shadows">Soft Shadows</option>
            <option value="high contrast">High Contrast</option>
            <option value="glow">Glow</option>
            <option value="overcast">Overcast</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        <div className="w-full max-w-2xl border border-gray-700 rounded-lg p-4 bg-gray-900 flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-white w-full max-w-sm">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300 text-center mb-2">Generating image...</p>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{progress}%</p>
            </div>
          ) : resultImage ? (
            <>
              <img src={resultImage} alt="Result" className="rounded max-w-full max-h-[480px] mb-4" />
              <a
                href={resultImage}
                download="rollersai_result.png"
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
              >
                Download Image
              </a>
            </>
          ) : preview ? (
            <img src={preview} alt="Preview" className="rounded max-w-full max-h-[480px]" />
          ) : (
            <p className="text-gray-500">No image selected</p>
          )}
        </div>
      </main>
    </>
  );
}
