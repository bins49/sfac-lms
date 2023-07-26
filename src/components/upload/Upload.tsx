"use client";

import { AttachmentFile } from "@/types/firebase.types";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import FileItem from "./FileItem";

interface props {
  role: "lecture" | "assignment";
  files: AttachmentFile[];
  setFiles: React.Dispatch<React.SetStateAction<AttachmentFile[]>>;
}

let allowedFileExtensions: string[] = [];

export default function Upload({ role = "lecture", files, setFiles }: props) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const dragRef = useRef<HTMLLabelElement | null>(null);
  if (error) console.log(error);

  if (role === "lecture") {
    allowedFileExtensions = ["mp4", "wav", "avi"];
  } else if (role === "assignment") {
    allowedFileExtensions = ["pdf", "doc", "docx", "hwp", "hwpx"];
  }

  const isValidExtension = useCallback((name: string) => {
    const lastIndex = name.lastIndexOf(".");
    const extension = name.substring(lastIndex + 1).toLowerCase();
    if (!allowedFileExtensions.includes(extension) || extension === "") {
      return false;
    }
    return true;
  }, []);

  const checkNumOfFiles = useCallback(
    (fileList: FileList): boolean => {
      let limit = 0;
      let errorMsg = "";

      if (role === "assignment") {
        errorMsg = "파일은 최대 5개까지 업로드가 가능합니다.";
        limit = 5;
      } else if (role === "lecture") {
        errorMsg =
          "이미 사용 중인 파일이 있습니다. 기존의 파일을 삭제하고 진행해주세요.";
        limit = 1;
      }

      setError("");
      if (fileList.length > limit) {
        setError(errorMsg);
        return false;
      }
      if (files.length === limit) {
        setError(errorMsg);
        return false;
      }

      return true;
    },
    [files.length, role],
  );

  const storeFiles = useCallback(
    (fileList: FileList | null): void => {
      if (fileList !== null && checkNumOfFiles(fileList)) {
        if (role === "lecture" && fileList.length > 1) return;
        for (let i = 0; i < fileList.length; i++) {
          const file = {
            name: fileList[i].name,
            url: URL.createObjectURL(fileList[i]),
          };
          if (isValidExtension(file.name)) {
            setFiles(current => [...current, file]);
          } else {
            setError(
              `파일 형식이 올바르지 않습니다. (${allowedFileExtensions.join(
                ", ",
              )})`,
            );
          }
        }
      }
    },
    [isValidExtension, role, checkNumOfFiles, setFiles],
  );

  const onChangeByDrag = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer !== null) {
        storeFiles(e.dataTransfer.files);
      }
    },
    [storeFiles],
  );

  const onChangeByClick = (e: ChangeEvent) => {
    storeFiles((e.target as HTMLInputElement).files);
  };

  const handleDragIn = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragOut = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer!.files) {
      setIsDragging(true);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();

      onChangeByDrag(e);
      setIsDragging(false);
    },
    [onChangeByDrag],
  );

  const initDragEvents = useCallback(() => {
    dragRef.current?.addEventListener("dragenter", handleDragIn);
    dragRef.current?.addEventListener("dragleave", handleDragOut);
    dragRef.current?.addEventListener("dragover", handleDragOver);
    dragRef.current?.addEventListener("drop", handleDrop);
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  const resetDragEvents = useCallback(() => {
    dragRef.current?.removeEventListener("dragenter", handleDragIn);
    dragRef.current?.removeEventListener("dragleave", handleDragOut);
    dragRef.current?.removeEventListener("dragover", handleDragOver);
    dragRef.current?.removeEventListener("drop", handleDrop);
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  useEffect(() => {
    initDragEvents();

    return () => resetDragEvents();
  }, [initDragEvents, resetDragEvents]);

  return (
    <div className="w-[700px]">
      <ul className="flex flex-col items-center">
        {files.map(file => {
          return (
            <FileItem name={file.name} setFiles={setFiles} key={file.name} />
          );
        })}
      </ul>
      <label
        htmlFor="fileUpload"
        ref={dragRef}
        className={`${
          files.length > 0 ? "h-[214px]" : "h-[298px]"
        } border-[3px] ${
          isDragging
            ? "border-primary-80 border-solid"
            : "border-grayscale-20 border-dashed"
        } rounded-lg flex justify-center items-center flex-col`}
      >
        <p className="text-grayscale-30">파일을 여기로 드래그 해주세요</p>
        <button
          onClick={() => dragRef.current?.click()}
          className="w-[200px] h-[38px] bg-primary-80 rounded-lg text-white"
        >
          컴퓨터에서 파일 선택
        </button>
      </label>
      <input
        type="file"
        id="fileUpload"
        className="opacity-0"
        onChange={onChangeByClick}
      />
    </div>
  );
}
