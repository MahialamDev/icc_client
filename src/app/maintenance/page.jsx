import React from "react";
import { MdBuild, MdPhone, MdWarning } from "react-icons/md";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-red-600 text-white text-center py-8">
          <div className="flex justify-center mb-3">
            <MdBuild className="text-7xl animate-bounce" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black">
            🚧 ওয়েবসাইট সাময়িকভাবে বন্ধ 🚧
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center">

          <h2 className="text-3xl md:text-4xl font-extrabold text-red-600">
            😅 ভাইয়া... আগে টাকা দেন!
          </h2>

          <p className="text-xl text-gray-700 mt-4 leading-9">
            অনেক দিন ধরে ধৈর্য ধরে অপেক্ষা করছি। 😇
            <br />
            এখন আর সার্ভারও অপেক্ষা করতে রাজি না।
          </p>

          <div className="my-8 bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6">

            <div className="flex justify-center">
              <MdWarning className="text-6xl text-yellow-600 animate-pulse" />
            </div>

            <h3 className="text-4xl font-black text-red-600 mt-3">
              💸 টাকা না দিলে...
            </h3>

            <p className="text-3xl font-bold text-gray-800 mt-3">
              😎 ওয়েবসাইটও চলবে না!
            </p>

            <p className="text-lg text-gray-700 mt-4">
              আগে বকেয়া পরিশোধ করুন, তারপর আবার সব আগের মতো চালু করে দেওয়া হবে। ❤️
            </p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6">

            <h3 className="text-2xl font-bold text-gray-800">
              👨‍💻 ডেভেলপার
            </h3>

            <p className="text-3xl font-extrabold text-blue-700 mt-2">
              Mahialam Rahat
            </p>

            <div className="flex justify-center items-center gap-2 mt-4">
              <MdPhone className="text-3xl text-green-600" />
              <span className="text-3xl font-black text-green-700">
                01979922268
              </span>
            </div>

            <p className="mt-6 text-lg text-gray-700 leading-8">
              💰 বকেয়া টাকা পরিশোধ করে উপরের নম্বরে যোগাযোগ করুন।
              <br />
              টাকা পাওয়ার সাথে সাথেই ইনশাআল্লাহ ওয়েবসাইট আবার চালু করে দেওয়া হবে।
            </p>
          </div>

          <div className="mt-8">
            <p className="text-2xl font-black text-red-600 animate-pulse">
              😂 টাকা আগে... তারপর ওয়েবসাইট! 😂
            </p>

            <p className="mt-3 text-gray-500 italic">
              সার্ভারও বলছে: <strong>বিল পরিশোধ না হওয়া পর্যন্ত আমি ছুটিতে আছি!</strong> 😎
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Maintenance;