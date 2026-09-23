const creditPopup = ({ message, status, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[300px] text-center">
        <h3
          className={`text-lg font-semibold mb-2 ${
            status ? "text-green-600" : "text-red-600"
          }`}
        >
          {status ? "Success" : "Alert"}
        </h3>

        <p className="text-gray-700 mb-4">{message}</p>

        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default creditPopup;
