'use client'
import React from 'react'
import type { DefaultCellComponentProps } from 'payload'

/**
 * Human-readable file size formatter for Payload Media collection table.
 * Converts raw byte counts into B, KB, or MB without altering database values.
 */
export const FileSizeCell: React.FC<DefaultCellComponentProps> = ({ cellData }) => {
  if (typeof cellData !== 'number') return null
  if (cellData < 1024) return <span>{cellData} B</span>
  if (cellData < 1024 * 1024) return <span>{(cellData / 1024).toFixed(1)} KB</span>
  return <span>{(cellData / (1024 * 1024)).toFixed(1)} MB</span>
}

export default FileSizeCell
