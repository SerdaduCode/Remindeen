const Footer = ({
  updateShowModal,
  updateShowSupport,
}: {
  updateShowModal: () => void;
  updateShowSupport: () => void;
}) => {
  return (
    <footer className="flex justify-between p-4">
      <div>
        <h4 onClick={updateShowModal} className="cursor-pointer">
          <span className="px-2 text-white rounded-full border-slate-100 border hover:bg-slate-100 hover:text-black transform duration-300">
            About
          </span>
        </h4>
      </div>
      <div>
        <h4 className="cursor-pointer" onClick={updateShowSupport}>
          <span className="px-2 text-white rounded-full border-slate-100 border hover:bg-slate-100 hover:text-black transform duration-300">
            Support
          </span>
        </h4>
      </div>
    </footer>
  );
};

export default Footer;
