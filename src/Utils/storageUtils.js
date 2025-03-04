// src/utils/storageUtils.js

export const savePostToLocalStorage = (post) => {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
  };
  
  export const getPostsFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('posts')) || [];
  };
  