import React, { useState } from "react";
import { getStackBlitzEmbedUrl } from "../utils/stackblitz";

type Props = {
  githubUrl: string;
  file?: string;
  height?: number; // px
  theme?: "dark" | "light";
};

const ProjectPreview: React.FC<Props> = ({ githubUrl, file, height = 600, theme = "light" }) => {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = getStackBlitzEmbedUrl(githubUrl, { file, theme, hideNavigation: true });

  if (!embedUrl) return <div className="text-sm text-red-500">URL do GitHub inválida.</div>;

  return (
    <div className="border rounded overflow-hidden">
      <div className="relative" style={{ height }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-gray-300 rounded-full animate-spin" />
              <div className="text-sm text-gray-600">Abrindo preview...</div>
            </div>
          </div>
        )}

        <iframe
          src={embedUrl}
          title={`Preview ${githubUrl}`}
          style={{ width: "100%", height: "100%", border: "none" }}
          onLoad={() => setLoaded(true)}
          allowFullScreen
        />
      </div>
      <div className="p-2 text-xs text-gray-500 flex justify-between">
        <span>Preview via StackBlitz</span>
        <a
          href={embedUrl.replace("?embed=1", "")}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Abrir no StackBlitz
        </a>
      </div>
    </div>
  );
};

export default ProjectPreview;
