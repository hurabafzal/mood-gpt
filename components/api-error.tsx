import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiErrorProps {
  message: string
  errorCode?: string
}

export function ApiError({ message, errorCode }: ApiErrorProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-rose-200 bg-rose-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-rose-700">API Configuration Error</CardTitle>
        </div>
        <CardDescription className="text-rose-600">
          {errorCode && <span className="font-mono text-xs">[{errorCode}]</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-rose-700">{message}</p>

        <div className="mt-4 bg-white p-3 rounded-md border border-rose-200">
          <h4 className="font-medium text-sm mb-2">Troubleshooting Steps:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
            <li>Check that your API keys are correctly set in your environment variables</li>
            <li>
              Verify that either <code className="bg-gray-100 px-1 rounded">DEEPINFRA_API_KEY</code> or{" "}
              <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY</code> is set
            </li>
            <li>Restart your application after updating environment variables</li>
            <li>Check the server logs for more detailed error information</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="w-1/2" asChild>
            <Link href="/debug">Debug Info</Link>
          </Button>
          <Button className="w-1/2 bg-rose-600 hover:bg-rose-700" asChild>
            <Link href="https://github.com/yourusername/moodgpt/wiki/API-Configuration" target="_blank">
              View Documentation
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
