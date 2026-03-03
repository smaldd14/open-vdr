import { useRef, useState } from 'react'
import { Button } from '@/react-app/components/ui/button'
import { Input } from '@/react-app/components/ui/input'
import { Label } from '@/react-app/components/ui/label'
import { useUpdateRoom, useUploadRoomLogo, useRoomLogoUrl } from '@/react-app/hooks/useRooms'
import type { DataRoom } from '@/react-app/lib/rooms'

type BrandingFormProps = {
  roomId: string
  room: DataRoom
}

export function BrandingForm({ roomId, room }: BrandingFormProps) {
  const [companyName, setCompanyName] = useState(room.company_name ?? '')
  const [primaryColor, setPrimaryColor] = useState(room.primary_color ?? '#3b82f6')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateRoom = useUpdateRoom(roomId)
  const uploadLogo = useUploadRoomLogo(roomId)
  const { data: logoUrl } = useRoomLogoUrl(roomId, !!room.logo_url)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corp"
          className="max-w-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary-color">Primary Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            id="primary-color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-9 w-16 cursor-pointer rounded border"
          />
          <Input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#3b82f6"
            className="w-32 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        {logoUrl && (
          <div className="mb-2">
            <img
              src={logoUrl}
              alt="Current logo"
              className="h-16 object-contain rounded border p-1"
            />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadLogo.mutate(file)
          }}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={uploadLogo.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadLogo.isPending ? 'Uploading...' : room.logo_url ? 'Replace Logo' : 'Upload Logo'}
        </Button>
      </div>

      <Button
        disabled={updateRoom.isPending}
        onClick={() =>
          updateRoom.mutate({
            company_name: companyName || null,
            primary_color: primaryColor || null,
          })
        }
      >
        {updateRoom.isPending ? 'Saving...' : 'Save Branding'}
      </Button>
    </div>
  )
}
