import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md">
        <div className="mb-6">
          <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">404</h1>
          <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link to="/rooms">Go to Rooms</Link>
        </Button>
      </Card>
    </div>
  );
};
