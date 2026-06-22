const Prayer = ({
  name,
  time,
  className,
  children,
}: {
  name: string;
  time: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={`${className} flex justify-between h-auto p-1 rounded-md`}>
      <h3>{name}</h3>
      <h3 className="flex gap-3">
        {time} {children}
      </h3>
    </div>
  );
};

export default Prayer;
