import { GraduationCap, Grid, Headphones, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const Supportbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div className="w-full max-w-[380px] bg-[#1c1f2d] text-white overflow-hidden z-50 h-[90vh]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Help</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/30"
          >
            {/* <X className="h-5 w-5" /> */}
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col">
          {/* FAQ Section */}
          <div className="py-6 flex flex-col items-center">
            <div className="bg-blue-600/20 p-2 rounded-md mb-2">
              <Grid className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">FAQ</h3>
            <p className="text-gray-400 text-sm">Open the database</p>
          </div>

          <div className="border-t border-gray-700" />

          {/* Tutorials Section */}
          <div className="py-6 flex flex-col items-center">
            <div className="bg-blue-600/20 p-2 rounded-md mb-2">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">Tutorials</h3>
            <p className="text-gray-400 text-sm">Use the hints</p>
          </div>

          <div className="border-t border-gray-700" />

          {/* Support Section */}
          <div className="py-6 flex flex-col items-center">
            <div className="bg-blue-600/20 p-2 rounded-md mb-2">
              <Headphones className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">Support</h3>
            <p className="text-gray-400 text-sm">Submit a ticket</p>
          </div>

          <div className="border-t border-gray-700" />

          {/* Contact Support Section */}
          <div className="py-6 flex flex-col items-center">
            <div className="bg-red-600/20 p-2 rounded-full mb-2">
              <HelpCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-center px-6 mb-2">
              Didn't find an answer to your question?
            </p>
            <Link to="/trading/support" className="text-blue-500 hover:underline">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supportbar;
