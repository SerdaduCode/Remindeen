const Footer = ({ updateShowModal }: { updateShowModal: () => void }) => {
  return (
    <footer className="flex justify-between p-4">
      <div>
        <h4 onClick={updateShowModal} className="cursor-pointer">
          <span className="bg-white px-2 text-black rounded-full opacity-80 hover:shadow-md hover:shadow-slate-200 ">
            About us
          </span>
        </h4>
      </div>
      <div>
        <h4 className="cursor-pointer">
          <span className="bg-white px-2 text-black rounded-full opacity-80 hover:shadow-md hover:shadow-slate-200">
            Support us
          </span>
        </h4>
      </div>
    </footer>
  );
};

export default Footer;
