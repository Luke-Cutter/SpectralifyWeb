export const ContentBox = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-content mt-5 p-4 md:p-6 shadow-content border-2 border-black${className}`}
  >
    {children}
  </div>
);