import ProfileCard from "./ProfileCard";
import InfoSection from "./InfoSection";

export default function Profile() {
  return (
    <div className="w-full max-w-6xl mx-auto py-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT OVERVIEW & CHANGE PASSWORD */}
        <div className="lg:col-span-1">
          <ProfileCard title="Profile Overview" />
        </div>

        {/* RIGHT PERSONAL INFORMATION */}
        <div className="lg:col-span-2 space-y-6">
          <InfoSection title="Personal Information" />
        </div>
      </div>
    </div>
  );
}
