import { UserButton } from "@clerk/nextjs";

const SetUpPage = () => {
  return (
      <div className="p-6">
       <UserButton afterSignOutUrl="/"/>
      </div>
      
  )
}

export default SetUpPage;