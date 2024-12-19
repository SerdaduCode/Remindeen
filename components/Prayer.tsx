const Prayer = ({ name, time }: { name: string; time: string }) => {
  return (
    <div className="flex justify-between h-auto">
      <h3>{name}</h3>
      <h3>{time}</h3>
    </div>
  );
};

export default Prayer;
