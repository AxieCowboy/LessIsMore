import { useState } from "react";

export default function HomePage() {
  const [posts, setPosts] = useState([
    { id: 1, content: "First post!", likes: 0, comments: [] },
    { id: 2, content: "Hello world!", likes: 0, comments: [] },
  ]);

  const likePost = (id) => {
    setPosts(posts.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <header className="w-full bg-white shadow-md p-4 flex justify-center gap-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Home</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Profile</button>
      </header>

      <main className="w-full max-w-md mt-4 flex flex-col items-center">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-md mb-4 w-80 text-center">
            <p>{post.content}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button 
                className="text-blue-500" 
                onClick={() => likePost(post.id)}
              >
                ☀️ {post.likes}
              </button>
              <button className="text-gray-500">💬 Comment</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
