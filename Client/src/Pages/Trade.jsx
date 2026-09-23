import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { betHistory } from "../Redux/Reducer/betReducer";

const Trade = () => {
  const { traderhistory } = useSelector((state) => state.bet);
  const [startDate, setStartDate] = useState(new Date("2024-03-24"));
  const [endDate, setEndDate] = useState(new Date("2025-12-24"));
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(betHistory());
  }, [dispatch]);

  // Filter trades by date range
  const filteredTrades = traderhistory?.filter(trade => {
    const tradeDate = new Date(trade.time);
    return tradeDate >= startDate && tradeDate <= endDate;
  }) || [];

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTrades.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredTrades.length / rowsPerPage);



  const handleFilter = () => {
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 0: // Pending
        return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case 1: // Completed
        return "bg-green-500 bg-opacity-20 text-green-400";
      default: // Failed
        return "bg-red-500 bg-opacity-20 text-red-400";
    }
  };

  return (
    <div className="text-white md:p-4 w-full mx-auto h-[80vh] overflow-auto">

      {/* Content Area */}
      <div className="p-4">
        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="bg-gray-700 text-white p-2 rounded border border-gray-600 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="bg-gray-700 text-white p-2 rounded border border-gray-600 w-full"
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition self-end"
            onClick={handleFilter}
          >
            Filter
          </button>
        </div>

        {/* Trade History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Bet</th>
                <th className="px-4 py-2">Trade Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-2">{trade.orderId}</td>
                  <td className="px-4 py-2">{trade.amount}</td>
                  <td className="px-4 py-2 capitalize">{trade.bet}</td>
                  <td className="px-4 py-2">{trade.tradeType}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${getStatusStyle(trade.status)}`}>
                      {trade.status === 0
                        ? "Pending"
                        : trade.status === 1
                        ? "Success"
                        : "Loss"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(trade.time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTrades.length > rowsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredTrades.length)} of {filteredTrades.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trade;