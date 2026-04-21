import { Link } from "react-router-dom";
import UploadForm from "./UploadForm";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

const Index = () => {
  return (
    <div className="relative">
      <div className="absolute right-4 top-4">
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Panel
          </Button>
        </Link>
      </div>
      <UploadForm />
    </div>
  );
};

export default Index;
