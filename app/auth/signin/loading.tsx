export default function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-4">
        <div className="text-center">
          <div className="h-8 w-32 bg-muted rounded-md mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded-md mx-auto animate-pulse" />
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded-md animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
          </div>

          <div className="space-y-2 pt-4">
            <div className="h-4 w-32 bg-muted rounded-md mx-auto animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded-md mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}