import React, { useState } from "react";
import ProjectPreview from "./ProjectPreview";
import { PreviewModal } from "./PreviewModal";

type Props = { githubUrl: string; file?: string; buttonLabel?: string };

const ProjectPreviewLazy: React.FC<Props> = ({ githubUrl, file, buttonLabel = "Visualizar Projeto" }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        {buttonLabel}
      </button>

      <PreviewModal open={open} onClose={() => setOpen(false)}>
        <div className="p-4">
          <ProjectPreview githubUrl={githubUrl} file={file} height={640} theme="dark" />
        </div>
      </PreviewModal>
    </>
  );
};

export default ProjectPreviewLazy;
