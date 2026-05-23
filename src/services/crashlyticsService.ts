import { FirebaseCrashlytics, StackFrame } from '@capacitor-community/firebase-crashlytics';

export interface CrashlyticsDiagnosticLog {
  timestamp: number;
  type: 'log' | 'exception' | 'userId' | 'context';
  message: string;
  details?: any;
}

class CrashlyticsService {
  private isPluginAvailable = false;
  private memoryLogs: CrashlyticsDiagnosticLog[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Safe platform check for Capacitor context
      const hasCapacitor = typeof (window as any).Capacitor !== 'undefined';
      if (hasCapacitor) {
        const cap = (window as any).Capacitor;
        // Verify if FirebaseCrashlytics plugin is loaded and registered
        if (cap.isPluginAvailable && cap.isPluginAvailable('FirebaseCrashlytics')) {
          this.isPluginAvailable = true;
          this.recordLocalDiagnostic('log', 'Firebase Crashlytics native plugin detected and initialized successfully.');
          
          // Log an initial message to the native side
          FirebaseCrashlytics.addLogMessage({ 
            message: `Crashlytics Web Bridge Initialized. Source: WebView, Time: ${new Date().toISOString()}` 
          }).catch(err => {
            console.warn('[CrashlyticsService] Failed to send initial log message:', err);
          });
          return;
        }
      }
      this.recordLocalDiagnostic('log', 'Firebase Crashlytics native plugin not available. Falling back to console and web memory diagnostics.');
    } catch (e) {
      console.warn('[CrashlyticsService] Initialization error checking native plugins:', e);
    }
  }

  /**
   * Safe check for active native integration status
   */
  public isActive(): boolean {
    return this.isPluginAvailable;
  }

  /**
   * Store diagnostic logs locally in-memory for live debug viewing on the web client
   */
  private recordLocalDiagnostic(type: CrashlyticsDiagnosticLog['type'], message: string, details?: any) {
    const log: CrashlyticsDiagnosticLog = {
      timestamp: Date.now(),
      type,
      message,
      details
    };
    this.memoryLogs.unshift(log);
    if (this.memoryLogs.length > 50) {
      this.memoryLogs.pop();
    }
  }

  /**
   * Retrieve in-memory logs recorded during this session
   */
  public getMemoryLogs(): CrashlyticsDiagnosticLog[] {
    return [...this.memoryLogs];
  }

  /**
   * Adds a breadcrumb log message that is sent along with subsequent fatal or non-fatal exceptions
   */
  public async log(message: string): Promise<void> {
    const timestampedMsg = `[WebLog ${new Date().toISOString()}] ${message}`;
    console.log(`[Crashlytics] Log: ${message}`);
    this.recordLocalDiagnostic('log', message);

    if (this.isPluginAvailable) {
      try {
        await FirebaseCrashlytics.addLogMessage({ message: timestampedMsg });
      } catch (err) {
        console.error('[Crashlytics Native Error] Failed to write native log:', err);
      }
    }
  }

  /**
   * Records a non-fatal JavaScript program exception to Firebase Crashlytics
   */
  public async recordException(error: unknown, contextLabel?: string): Promise<void> {
    const timeStr = new Date().toISOString();
    let errorMessage = 'An unknown JavaScript error occurred';
    let errorStackStr = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStackStr = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = String(error);
      }
    }

    const fullMessage = contextLabel 
      ? `[${contextLabel}] ${errorMessage} (at ${timeStr})`
      : `${errorMessage} (at ${timeStr})`;

    console.error(`[Crashlytics Non-Fatal] ${fullMessage}`, error);
    this.recordLocalDiagnostic('exception', errorMessage, { contextLabel, stack: errorStackStr });

    if (this.isPluginAvailable) {
      try {
        const parsedFrames = this.parseErrorStack(errorStackStr);
        
        // Log extra context regarding the crash to raw breadcrumbs first
        await FirebaseCrashlytics.addLogMessage({ 
          message: `EXCEPTION REPORT: Msg: ${errorMessage} | Label: ${contextLabel || 'none'} | Stack: ${errorStackStr.substring(0, 300)}` 
        });

        if (contextLabel) {
          await FirebaseCrashlytics.setContext({
            key: 'last_exception_context',
            value: contextLabel,
            type: 'string'
          });
        }

        await FirebaseCrashlytics.recordException({
          message: fullMessage,
          stacktrace: parsedFrames.length > 0 ? parsedFrames : undefined
        });
      } catch (err) {
        console.error('[Crashlytics Native Error] Failed to record native exception:', err);
      }
    }
  }

  /**
   * Associates a unique user ID identifier with subsequent crashlytics telemetry
   */
  public async setUserId(userId: string): Promise<void> {
    this.recordLocalDiagnostic('userId', `Set user ID: ${userId}`);
    console.log(`[Crashlytics] Tracking User ID: ${userId}`);

    if (this.isPluginAvailable) {
      try {
        await FirebaseCrashlytics.setUserId({ userId });
      } catch (err) {
        console.error('[Crashlytics Native Error] Failed to set native user ID:', err);
      }
    }
  }

  /**
   * Sets custom key-value pairs associated with crash reports for debugging
   */
  public async setContext(
    key: string, 
    value: string | number | boolean, 
    type: 'string' | 'long' | 'double' | 'boolean' | 'int' | 'float' = 'string'
  ): Promise<void> {
    this.recordLocalDiagnostic('context', `Set Context: ${key} = ${value} (Type: ${type})`);
    console.log(`[Crashlytics] Context Key: ${key} = ${value}`);

    if (this.isPluginAvailable) {
      try {
        await FirebaseCrashlytics.setContext({ key, value, type });
      } catch (err) {
        console.error('[Crashlytics Native Error] Failed to set native context:', err);
      }
    }
  }

  /**
   * Forces a real app crash (highly useful for validating development-phase Crashlytics integrations)
   */
  public async forceCrash(message = 'Development Testing App Crash'): Promise<void> {
    this.recordLocalDiagnostic('log', `FORCING APPCRAFT CRASH: "${message}"`);
    console.warn(`[Crashlytics] Triggering native crash: "${message}"`);

    if (this.isPluginAvailable) {
      try {
        await FirebaseCrashlytics.crash({ message });
      } catch (err) {
        console.error('[Crashlytics Native Error] Failed to send native crash trigger:', err);
      }
    } else {
      throw new Error(`[Mock Crashlytics Trigger] ${message}`);
    }
  }

  /**
   * Parser utility converting stack traces into structured StackFrames for Crashlytics
   */
  private parseErrorStack(stack?: string): StackFrame[] {
    if (!stack || typeof stack !== 'string') return [];
    
    const frames: StackFrame[] = [];
    const lines = stack.split('\n');
    
    for (const line of lines) {
      try {
        // Matches typical style "   at functionName (http://domain/path/file.js:line:col)"
        const completeMatch = line.match(/^\s*at\s+(.+?)\s*\((.+?):(\d+):(\d+)\)/);
        if (completeMatch && completeMatch.length === 5) {
          const fn = completeMatch[1];
          const urlStr = completeMatch[2];
          const lineNumStr = completeMatch[3];
          
          // Extract only the filename from full relative/absolute URLs
          const filename = urlStr.substring(urlStr.lastIndexOf('/') + 1);
          
          frames.push({
            functionName: fn,
            fileName: filename,
            lineNumber: parseInt(lineNumStr, 10)
          });
          continue;
        }

        // Matches fallback styles "   at http://domain/path/file.js:line:col"
        const anonymousMatch = line.match(/^\s*at\s+(.+?):(\d+):(\d+)/);
        if (anonymousMatch && anonymousMatch.length === 4) {
          const urlStr = anonymousMatch[1];
          const lineNumStr = anonymousMatch[2];
          const filename = urlStr.substring(urlStr.lastIndexOf('/') + 1);

          frames.push({
            functionName: 'anonymous',
            fileName: filename,
            lineNumber: parseInt(lineNumStr, 10)
          });
        }
      } catch (err) {
        // Ignore parsing errors for individual lines so we process the rest of the stack
      }
    }
    
    return frames.slice(0, 25); // Cap to top 25 frames
  }
}

export const crashlyticsService = new CrashlyticsService();
