export const savePostToLocalStorage = (newPost) => {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts.push(newPost);
  localStorage.setItem('posts', JSON.stringify(posts));
};

export const addCommentToPost = (postId, comment) => {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].comments.push(comment);
    localStorage.setItem('posts', JSON.stringify(posts));
  }
};
