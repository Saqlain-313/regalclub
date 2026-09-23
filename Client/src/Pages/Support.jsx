
import React, { useState } from "react"
import { X } from "lucide-react"
import { useDispatch } from "react-redux"
import { postSupport } from "../Redux/Reducer/authReducer"
import { toast } from "react-toastify"
import Sidebar from "../components/Sidebar"
import Top from "../components/top"

export default function SupportModal() {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dispatch = useDispatch()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      const fileType = droppedFile.type.split("/")[1]

      if (["jpg", "jpeg", "png", "pdf"].includes(fileType) && droppedFile.size <= 2 * 1024 * 1024) {
        setFile(droppedFile)
      } else {
        toast.error("Invalid file type or size exceeds 2MB")
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      const fileType = selectedFile.type.split("/")[1]

      if (["jpg", "jpeg", "png", "pdf"].includes(fileType) && selectedFile.size <= 2 * 1024 * 1024) {
        setFile(selectedFile)
      } else {
        toast.error("Invalid file type or size exceeds 2MB")
      }
    }
  }

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please upload a file before submitting")
      return
    }

    const formData = new FormData()
    formData.append("message", message)
    formData.append("image", file)

    dispatch(postSupport(formData)).then((res) => {
      if (res?.payload?.success) {
        toast.success(res.payload.message)
        setMessage("")
        setFile(null)
      } else {
        toast.error(res.payload.message)
      }
    })
  }

  const [topPopupOpen, setTopPopupOpen] = useState(false);
  return (
    <div className="flex item-center">
    <div className="relative w-[80px] hidden md:block">
    <Sidebar topPopupOpen={topPopupOpen} setTopPopupOpen={setTopPopupOpen} />
    </div>

    <div
        className={`
    transition-all duration-500 ease-in-out
    overflow-hidden
    ${topPopupOpen ? "w-[550px] opacity-100" : "w-0 opacity-0"}
  `}
      >
        <Top topPopupOpen={topPopupOpen} setTopPopupOpen={setTopPopupOpen} />
      </div>

    <div className="flex items-center justify-center mb-[50px] lg:mb-0 w-full">
      <div className="w-full max-w-3xl bg-[#1e2230] rounded-lg shadow-lg p-6 m-4">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-xl font-bold text-white">Submit issue here</h2>
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">
            Message
          </label>
          <textarea
            id="message"
            rows={8}
            className="w-full bg-[#1e2230] border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <div
            className={`border-2 border-dashed ${
              isDragging ? "border-blue-500" : "border-gray-600"
            } rounded-md p-6 text-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileUpload"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="fileUpload" className="cursor-pointer">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Attachment</h3>
                <p className="text-sm text-gray-400">Click or Drop a file here</p>
                <p className="text-xs text-gray-500">Formats: jpg, jpeg, png, pdf • Max: 2Mb</p>
                {file && (
                  <div className="mt-3 text-left">
                    <p className="text-sm text-gray-400">Selected: {file.name}</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition duration-200"
        >
          Confirm & send request
        </button>
      </div>
    </div>
    </div>
  )
}
