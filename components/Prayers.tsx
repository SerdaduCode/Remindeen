import Prayer from "./Prayer";

const Prayers = () => {
  return (
    <div className="flex flex-col gap-1 text-base md:text-xl">
      <Prayer name="Fajr" time="04:15" />
      <Prayer name="Dhuzhur" time="11:35" />
      <Prayer name="Ashar" time="15:15" />
      <Prayer name="Magrib" time="17:59" />
      <Prayer name="Isya" time="19:05" />
    </div>
  );
};

export default Prayers;
