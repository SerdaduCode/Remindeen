import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const Profile = () => {
  return (
    <div>
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Account Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="text-sm font-medium">Dhyoga</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">dhyogap@gmail.com</span>
            {/* <Badge
                variant="outline"
                className="text-green-600 border-green-600"
                >
                Active
                </Badge> */}
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">July 2025</span>
          </div>
        </div>
      </div>

      <Separator></Separator>

      <div className="space-y-3 mt-3">
        <Button className="w-full">Edit Profile</Button>
      </div>
    </div>
  )
}

export default Profile
