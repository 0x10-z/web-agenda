
const Footer = () => {
  return (
    <div className="flex-none px-3 pt-2 pb-3 text-center text-xs text-gray-600 md:px-4 md:pt-3 md:pb-6">
      <span>Frontend v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
    </div>
  );
};

export default Footer;
