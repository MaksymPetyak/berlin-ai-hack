import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateUserProfile } from "@/app/actions";
import { CustomFields } from "@/components/custom-fields";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch existing profile data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex-1 w-full flex flex-col gap-6 items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        
        <form action={updateUserProfile} className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium mb-2">Basic Information</h2>
              
              <div>
                <label 
                  htmlFor="first_name" 
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  placeholder="Enter your first name"
                  defaultValue={profile?.first_name || ''}
                />
              </div>

              <div>
                <label 
                  htmlFor="last_name" 
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  placeholder="Enter your last name"
                  defaultValue={profile?.last_name || ''}
                />
              </div>

              <div>
                <label 
                  htmlFor="birthday" 
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Birthday
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  defaultValue={profile?.birthday || ''}
                />
              </div>

              <div>
                <label 
                  htmlFor="phone_number" 
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  placeholder="Enter your phone number"
                  defaultValue={profile?.phone_number || ''}
                />
              </div>

              <div>
                <label 
                  htmlFor="address" 
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="w-full px-4 py-2 border rounded-md bg-background"
                  placeholder="Enter your address"
                  defaultValue={profile?.address || ''}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium mb-2">Custom Fields</h2>
              <CustomFields initialFields={profile?.custom_fields || {}} />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}