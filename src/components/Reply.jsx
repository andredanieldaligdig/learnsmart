import React from "react";

const Reply = ({ reply }) => (
  <div className="text-sm text-slate-200">
    <span className="font-semibold text-slate-100">{reply.username}</span>
    <span className="text-slate-400">{" \u00B7 "}</span>
    <span className="whitespace-pre-wrap">{reply.content}</span>
  </div>
);

export default Reply;
