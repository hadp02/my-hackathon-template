import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, CreditCard, DollarSign, Clock, Search, Wrench, Network, ChevronDown, ChevronRight, X, Bot, Cpu, Zap, CheckCircle2 } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/OverviewChart"

interface TraceMetrics {
  total_runs: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_latency: number;
  avg_ttft: number;
  total_cost: number;
  total_errors: number;
  success_rate: number;
  cache_hit_rate: number;
  total_tool_calls: number;
  avg_tps: number;
  avg_groundedness: number;
  avg_relevance: number;
}

interface Trace {
  id: number;
  run_id: string;
  parent_run_id: string | null;
  session_id: string | null;
  user_id: string;
  tenant_id: string;
  agent_id: string;
  step_type: string;
  model: string | null;
  prompt_version: string | null;
  tools_called: string;
  tool_outputs_summary: string | null;
  input_text: string;
  output_text: string;
  status: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  ttft_ms: number;
  tokens_per_sec: number;
  cost_usd: number;
  is_cache_hit: boolean;
  error_message: string | null;
  finish_reason: string;
  is_regenerated: boolean;
  eval_status: string;
  eval_groundedness: number | null;
  eval_relevance: number | null;
  feedback_score: number | null;
  created_at: string;
}

export default function AITracingDashboard() {
  const [metrics, setMetrics] = useState<TraceMetrics>({ 
    total_runs: 0, total_tokens: 0, total_input_tokens: 0, total_output_tokens: 0, avg_latency: 0, avg_ttft: 0, total_cost: 0, total_errors: 0, success_rate: 0, cache_hit_rate: 0, total_tool_calls: 0, avg_tps: 0, avg_groundedness: 0, avg_relevance: 0
  });
  const [traces, setTraces] = useState<Trace[]>([]);
  const [chartData, setChartData] = useState<{name: string, total: number}[]>([]);
  
  // Tree state
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';
        const res = await fetch(`${apiUrl}/api/v1/ai/traces`);
        const data = await res.json();
        setMetrics(data.metrics);
        setTraces(data.traces);
        
        // Map last 20 traces to chart data (reverse to chronological order)
        const recentTraces = data.traces.filter((t: Trace) => !t.parent_run_id).slice(0, 20).reverse();
        setChartData(recentTraces.map((t: Trace, i: number) => ({
          name: `Run ${i+1}`,
          total: t.total_tokens
        })));
      } catch (e) {
        console.error("Error fetching traces", e);
      }
    };
    
    fetchTraces();
    const interval = setInterval(fetchTraces, 5000);
    return () => clearInterval(interval);
  }, []);

  const traceTree = useMemo(() => {
    const rootTraces: Trace[] = [];
    const childrenMap: Record<string, Trace[]> = {};
    
    traces.forEach(t => {
      if (!t.parent_run_id) {
        rootTraces.push(t);
      } else {
        if (!childrenMap[t.parent_run_id]) childrenMap[t.parent_run_id] = [];
        childrenMap[t.parent_run_id].push(t);
      }
    });
    return { rootTraces, childrenMap };
  }, [traces]);

  const toggleExpand = (runId: string) => {
    const newSet = new Set(expandedRuns);
    if (newSet.has(runId)) newSet.delete(runId);
    else newSet.add(runId);
    setExpandedRuns(newSet);
  };

  const getStepIcon = (stepType: string) => {
    if (stepType === 'tool_call') return <Wrench className="h-4 w-4 text-orange-500" />;
    if (stepType === 'sub_agent') return <Network className="h-4 w-4 text-blue-500" />;
    if (stepType === 'rag_retrieval') return <Search className="h-4 w-4 text-green-500" />;
    if (stepType === 'main_agent') return <Bot className="h-4 w-4 text-purple-500" />;
    return <Activity className="h-4 w-4 text-primary" />;
  };

  const TraceRow = ({ trace, depth = 0 }: { trace: Trace, depth?: number }) => {
    const children = traceTree.childrenMap[trace.run_id] || [];
    const isExpanded = expandedRuns.has(trace.run_id);
    const hasChildren = children.length > 0;
    
    return (
      <>
        <TableRow 
          className={`cursor-pointer hover:bg-muted/50 ${selectedTrace?.id === trace.id ? 'bg-muted' : ''}`}
          onClick={() => setSelectedTrace(trace)}
        >
          <TableCell className="font-medium text-xs max-w-[200px]">
            <div className="flex items-start gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
              <div 
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-muted"
                onClick={(e) => { 
                  if (hasChildren) {
                    e.stopPropagation(); 
                    toggleExpand(trace.run_id); 
                  }
                }}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                ) : <span className="h-3 w-3" />}
              </div>
              
              {getStepIcon(trace.step_type)}
              
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  {trace.step_type.replace('_', ' ').toUpperCase()}
                  {trace.model && trace.model !== 'unknown' && (
                    <span className="flex items-center text-[10px] font-normal text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm">
                      <Cpu className="h-3 w-3 mr-1" />
                      {trace.model}
                    </span>
                  )}
                  {trace.is_cache_hit ? (
                    <span className="flex items-center text-[10px] font-normal text-green-600 bg-green-100 px-1.5 py-0.5 rounded-sm">
                      Cache Hit
                    </span>
                  ): null}
                </span>
                <span className="truncate text-muted-foreground" title={trace.input_text}>
                  {trace.input_text || "No input"}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-right text-xs align-top">
            <div className="flex flex-col items-end gap-1">
              <span className="font-semibold">{trace.total_tokens.toLocaleString()}</span>
              {(trace.prompt_tokens > 0 || trace.completion_tokens > 0) && (
                <span className="text-[10px] text-muted-foreground">
                  {trace.prompt_tokens} i / {trace.completion_tokens} o
                </span>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right text-xs align-top">
            <div className="flex flex-col items-end gap-1">
              <span>{trace.latency_ms}ms</span>
              {trace.tokens_per_sec > 0 && <span className="text-[10px] text-muted-foreground font-mono">{trace.tokens_per_sec} TPS</span>}
            </div>
          </TableCell>
          <TableCell className="text-right text-xs align-top">
            {trace.status === 'failed' || trace.error_message ? (
              <Badge variant="destructive">Error</Badge>
            ) : trace.status === 'pending' ? (
               <Badge variant="secondary" className="animate-pulse">Running</Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50">Success</Badge>
            )}
          </TableCell>
        </TableRow>
        {isExpanded && children.map(child => <TraceRow key={child.id} trace={child} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Tracing Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your AI Agents' real-time performance, token consumption, cost, and latency.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className={`h-4 w-4 ${metrics.success_rate > 95 ? 'text-green-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.success_rate}%</div>
            <p className="text-xs text-muted-foreground">{metrics.total_errors} errors / {metrics.total_runs} runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.total_cost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Estimated API cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens (In / Out)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_tokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{metrics.total_input_tokens.toLocaleString()} i / {metrics.total_output_tokens.toLocaleString()} o</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cache_hit_rate}%</div>
            <p className="text-xs text-muted-foreground">Responses served from cache</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latency & TTFT</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_latency}ms</div>
            <p className="text-xs text-muted-foreground">Avg TTFT: {metrics.avg_ttft}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Speed (TPS)</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_tps} <span className="text-sm font-normal text-muted-foreground">t/s</span></div>
            <p className="text-xs text-muted-foreground">{metrics.total_tool_calls} tool calls made</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groundedness (Sampled)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_groundedness ? (metrics.avg_groundedness * 100).toFixed(0) + '%' : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Context alignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relevance (Sampled)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_relevance ? (metrics.avg_relevance * 100).toFixed(0) + '%' : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Intent satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>Chronological view of token consumption per AI request.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="col-span-3 overflow-hidden flex flex-col h-full min-h-[500px]">
          <CardHeader className="pb-3 border-b">
            <CardTitle>Traces Explorer</CardTitle>
            <CardDescription>
              Hierarchical view of Agent and Tool executions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[50%]">Step</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {traceTree.rootTraces.map((trace) => (
                  <TraceRow key={trace.id} trace={trace} />
                ))}
                {traceTree.rootTraces.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                      No traces found. Go to Workspace and trigger an agent run!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Trace Detail Side Panel Overlay */}
      {selectedTrace && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-background border-l shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {getStepIcon(selectedTrace.step_type)}
                {selectedTrace.step_type.replace('_', ' ').toUpperCase()} Detail
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">Run ID: {selectedTrace.run_id}</p>
            </div>
            <button 
              onClick={() => setSelectedTrace(null)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Model / Prompt</p>
                  <p className="text-sm">{selectedTrace.model || 'N/A'} <Badge variant="secondary" className="ml-1 font-mono text-[10px]">{selectedTrace.prompt_version || 'v1.0'}</Badge></p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">User & Tenant</p>
                  <p className="text-sm font-mono">{selectedTrace.user_id} @ {selectedTrace.tenant_id}</p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Time</p>
                  <p className="text-sm">{new Date(selectedTrace.created_at + 'Z').toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Cost & Speed</p>
                  <p className="text-sm font-mono text-green-600">${selectedTrace.cost_usd.toFixed(6)} <span className="text-muted-foreground ml-2">{selectedTrace.tokens_per_sec > 0 ? `${selectedTrace.tokens_per_sec} t/s` : ''}</span></p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Finish Reason</p>
                  <p className="text-sm"><Badge variant="outline">{selectedTrace.finish_reason}</Badge></p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Quality Eval</p>
                  <p className="text-sm font-mono flex gap-2">
                    {selectedTrace.eval_status === 'completed' ? (
                      <>
                        <span className="text-blue-600">G: {selectedTrace.eval_groundedness}</span>
                        <span className="text-purple-600">R: {selectedTrace.eval_relevance}</span>
                      </>
                    ) : selectedTrace.eval_status === 'pending' ? (
                      <span className="text-muted-foreground italic">Pending...</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </p>
               </div>
            </div>

            {/* Note about PII */}
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md p-3 text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Security Note:</span> Input and Output text may contain PII. In a production setting, this data should be redacted or subjected to a strict data retention policy before being stored.
            </div>

            {/* Content blocks */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold border-b pb-1">Input</h3>
              <pre className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto border">
                {selectedTrace.input_text || "No input text provided."}
              </pre>
            </div>

            {selectedTrace.tools_called && selectedTrace.tools_called !== "[]" && (
               <div className="space-y-2">
                 <h3 className="text-sm font-semibold border-b pb-1 flex items-center gap-2">
                    <Wrench className="h-4 w-4" /> Tools Called
                 </h3>
                 <pre className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre-wrap overflow-x-auto border text-blue-600 dark:text-blue-400">
                   {JSON.stringify(JSON.parse(selectedTrace.tools_called), null, 2)}
                 </pre>
               </div>
            )}

            {selectedTrace.tool_outputs_summary && (
               <div className="space-y-2">
                 <h3 className="text-sm font-semibold border-b pb-1">Tool Outputs (Summary)</h3>
                 <pre className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto border text-green-700 dark:text-green-400">
                   {selectedTrace.tool_outputs_summary}
                 </pre>
               </div>
            )}

            {selectedTrace.output_text && (
               <div className="space-y-2">
                 <h3 className="text-sm font-semibold border-b pb-1">Output</h3>
                 <pre className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto border border-primary/20">
                   {selectedTrace.output_text}
                 </pre>
               </div>
            )}

            {selectedTrace.error_message && (
               <div className="space-y-2">
                 <h3 className="text-sm font-semibold border-b pb-1 text-red-600">Error Message</h3>
                 <pre className="bg-red-50 text-red-600 p-3 rounded-md text-xs font-mono whitespace-pre-wrap border border-red-200">
                   {selectedTrace.error_message}
                 </pre>
               </div>
            )}
          </div>
        </div>
      )}
      
      {/* Backdrop for side panel */}
      {selectedTrace && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSelectedTrace(null)}
        />
      )}
    </div>
  )
}
