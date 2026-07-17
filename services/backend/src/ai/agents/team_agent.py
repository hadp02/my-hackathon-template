from typing import Optional
from agno.agent import Agent
from src.ai.core.base_agent import BaseAgent

def get_team_agent(session_id: Optional[str] = None) -> Agent:
    """
    Creates a Multi-Agent Team equipped to handle complex requests
    by delegating to sub-agents (e.g. Researcher, Writer).
    """
    
    # 1. Researcher Agent
    researcher = Agent(
        name="Researcher",
        role="Search for information and gather data",
        instructions=[
            "You are an expert researcher.",
            "Gather comprehensive data related to the user's request."
        ],
        # tools=[...] # Add tools like DuckDuckGo or Wikipedia here
    )

    # 2. Writer Agent
    writer = Agent(
        name="Writer",
        role="Write and synthesize information",
        instructions=[
            "You are a professional technical writer.",
            "Take the research data and synthesize it into a well-structured, clear, and concise report.",
            "Write in Vietnamese unless requested otherwise."
        ]
    )

    # 3. Team Agent (Leader)
    return BaseAgent.create(
        agent_id="team_assistant",
        name="Team Assistant",
        instructions=[
            "You are the leader of a team consisting of a Researcher and a Writer.",
            "When a complex question is asked, delegate to the Researcher to gather facts, then to the Writer to draft the response.",
            "Coordinate them to produce the best possible answer."
        ],
        team=[researcher, writer],
        show_tool_calls=True,
        markdown=True,
        session_id=session_id
    )
