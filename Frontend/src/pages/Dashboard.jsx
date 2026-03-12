import { useAuth } from "../context/AuthContext";
import MentorReflectionForm from "../components/MentorReflectionForm";
import MenteeReflectionForm from "../components/MenteeReflectionForm";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-[90vh] flex items-center justify-center text-xl">
        Please login first
      </div>
    );
  }

  return (
    <div className="h-[90vh] w-full overflow-y-auto overflow-x-hidden px-4 py-6 flex justify-center">
      {user.role === "mentor" ? (
        <MentorReflectionForm />
      ) : (
        <MenteeReflectionForm />
      )}
    </div>
  );
}

export default Dashboard;