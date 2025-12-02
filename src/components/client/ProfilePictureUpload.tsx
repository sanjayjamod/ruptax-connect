import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getClientProfile, saveProfilePic, deleteProfilePic, fileToBase64 } from "@/lib/clientFileStorage";

interface ProfilePictureUploadProps {
  clientId: string;
  clientName: string;
  onUpdate?: () => void;
}

const ProfilePictureUpload = ({ clientId, clientName, onUpdate }: ProfilePictureUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = getClientProfile(clientId);
  const [profilePic, setProfilePic] = useState<string | undefined>(profile?.profilePic);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      saveProfilePic(clientId, base64);
      setProfilePic(base64);
      toast({
        title: "Success",
        description: "Profile picture updated"
      });
      onUpdate?.();
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    deleteProfilePic(clientId);
    setProfilePic(undefined);
    toast({
      title: "Deleted",
      description: "Profile picture removed"
    });
    onUpdate?.();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          {profilePic ? (
            <AvatarImage src={profilePic} alt={clientName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(clientName) || <User className="h-10 w-10" />}
            </AvatarFallback>
          )}
        </Avatar>
        <Button
          size="icon"
          variant="secondary"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {profilePic && (
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-1" />
          Remove Photo
        </Button>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
