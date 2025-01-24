const Footer = ({ updateShowModal }: { updateShowModal: () => void }) => {
  return (
    <footer className="flex justify-between p-4">
      <div>
        <h4 onClick={updateShowModal} className="cursor-pointer">
          About us
        </h4>
      </div>
      <div>
        <h4>Support us</h4>
      </div>
    </footer>
  );
};

export default Footer;
