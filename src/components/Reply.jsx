import React from "react";

const Reply = ({ reply }) => (
  <div className="reply">
    <strong>{reply.username}</strong>: {reply.content}
  </div>
);

export default Reply;
