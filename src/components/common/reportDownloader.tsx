"use client";

import { useState } from "react";
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  summarizeData,
  addSummaryTotalRow,
} from "@/utils/methods/exportUtils";
import Button from "../ui/button/Button";
import { FaDownload, FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa6";
import { Modal } from "../ui/modal";
import Label from "../form/components/Label";
import MultiSelect from "../form/components/MultiSelect";
import Checkbox from "../form/components/input/Checkbox";
import Select from "../form/components/Select";

export default function ReportDownloader({ data, reportName = "" }) {
  const [excludeKeys, setExcludeKeys] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [summarize, setSummarize] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSetExcludeKeys = (selected) => {
    setExcludeKeys(selected)
  }

  const handleSetPeriod = (selected) => {
    setPeriod(selected)
  }

  const handleDownload = (type) => {
  let exportData = data;

  if (summarize) {
    exportData = summarizeData(data, "Date", period);
    exportData = addSummaryTotalRow(exportData, "total");
  }


    if (type === "excel") exportToExcel(exportData, `BA ${reportName} Report ${summarize ? 'Summary' : ''}`, excludeKeys);
    if (type === "csv") exportToCSV(exportData, `BA ${reportName} Report ${summarize ? 'Summary' : ''}`, excludeKeys);
    if (type === "pdf") exportToPDF(exportData, `BA ${reportName} Report ${summarize ? 'Summary' : ''}`, excludeKeys);
  };

  const availableKeys = data[0] ? Object.keys(data[0]) : [];

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        startIcon={<FaDownload size={18} />}
        variant="link_light"
      >
        Download current
      </Button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-2xl"
      >
        <div className="p-4 space-y-4 m-auto">
          <div>
            <h2 className="text-lg font-semibold dark:text-gray-300">Download Report</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">This report is downloaded based on your set filters. <a className="text-gray-800 dark:text-gray-100" target="__blank" href="/sales">See How</a></span>
          </div>
          <div>
            <Label className="font-medium">Exclude Keys:</Label>
            <MultiSelect
              options={availableKeys.map((key) => ({
                value: key,
                text: key,
              }))}
              value={excludeKeys.map((key) => ({
                value: key,
                text: key,
              }))}
              onChange={handleSetExcludeKeys}
              placeholder="Select keys to exclude"
              className="w-full mt-1"
            />
          </div>

          <div className="flex items-center gap-4">
            <Label className="font-medium">Summarize (by Date):</Label>
            <Checkbox
              checked={summarize}
              onChange={() => setSummarize(!summarize)}
            />
          </div>

          {summarize && (
            <div>
              <Label className="font-medium">Period:</Label>
              <Select
                onChange={handleSetPeriod}
                placeholder="Select period"
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "weekly", label: "Weekly" },
                ]}
                className="w-full mt-1"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => handleDownload("excel")}
              variant="link_success"
              startIcon={<FaFileExcel size={18} />}
            >
              Download Excel
            </Button>
            <Button
              onClick={() => handleDownload("csv")}
              variant="link"
              startIcon={<FaFileCsv size={18} />}
            >
              Download CSV
            </Button>
            <Button
              onClick={() => handleDownload("pdf")}
              variant="link_warning"
              startIcon={<FaFilePdf size={18} />}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
