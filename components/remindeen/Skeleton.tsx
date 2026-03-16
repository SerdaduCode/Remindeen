const Skeleton = () => {
  return (
    <div role="status" className="max-w-sm animate-pulse mt-1.5">
      <div className="h-4 bg-[#2e2a1a] opacity-60 rounded-full max-w-[360px] mb-4"></div>
      <div className="h-4 bg-[#2e2a1a] opacity-60 rounded-full max-w-[330px] mb-4"></div>
      <div className="h-4 bg-[#2e2a1a] opacity-60 rounded-full max-w-[300px] mb-4"></div>
      <div className="h-4 bg-[#2e2a1a] opacity-60 rounded-full max-w-[300px] mb-4"></div>
      <div className="h-4 bg-[#2e2a1a] opacity-60 rounded-full max-w-[300px] mb-4"></div>
    </div>
  );
};

export default Skeleton;
