/* eslint-disable react/prop-types */
import { AiFillFileExcel } from "react-icons/ai";

const FileInput = ({ onFileChange }) => {
  const handleFileChange = (event) => {
    const fileList = event.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      onFileChange(file);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <label
        htmlFor="file"
        className="
          group
          flex
          w-fit
          cursor-pointer
          items-center
          gap-3
          rounded-xl
          border
          border-border
          bg-primary-variant
          px-5
          py-3
          text-white
          shadow-lg
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:bg-primary/20
          hover:shadow-primary/10
          active:translate-y-0
        "
      >
        <span
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-bg
            text-primary
            transition-transform
            duration-200
            group-hover:scale-105
          "
        >
          <AiFillFileExcel className="text-2xl" />
        </span>

        <span className="flex flex-col">
          <span className="text-sm font-semibold">Import Exam</span>

          <span className="text-xs text-light">Upload Excel file</span>
        </span>

        <input
          type="file"
          id="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".xlsx,.xls"
        />
      </label>
    </div>
  );
};

export default FileInput;
