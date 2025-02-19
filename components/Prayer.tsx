const Prayer = ({
  name,
  time,
  children,
}: {
  name: string;
  time: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex justify-between h-auto">
      <h3>{name}</h3>
      <h3 className="flex gap-3">
        {time} {children}
      </h3>
    </div>
  );
};

export default Prayer;
