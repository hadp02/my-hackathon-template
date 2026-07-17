"""add agent trace

Revision ID: a1b2c3d4e5f6
Revises: 635db34ad53a
Create Date: 2026-07-15 11:54:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '635db34ad53a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table('agent_traces',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('run_id', sa.String(length=255), nullable=True),
        sa.Column('parent_run_id', sa.String(length=255), nullable=True),
        sa.Column('session_id', sa.String(length=255), nullable=True),
        sa.Column('user_id', sa.String(length=255), nullable=True),
        sa.Column('tenant_id', sa.String(length=255), nullable=True),
        sa.Column('agent_id', sa.String(length=255), nullable=True),
        sa.Column('step_type', sa.String(length=100), nullable=True),
        sa.Column('model', sa.String(length=255), nullable=True),
        sa.Column('prompt_version', sa.String(length=100), nullable=True),
        sa.Column('tools_called', sa.Text(), nullable=True),
        sa.Column('tool_outputs_summary', sa.Text(), nullable=True),
        sa.Column('input_text', sa.Text(), nullable=True),
        sa.Column('output_text', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('prompt_tokens', sa.Integer(), nullable=True),
        sa.Column('completion_tokens', sa.Integer(), nullable=True),
        sa.Column('total_tokens', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('ttft_ms', sa.Integer(), nullable=True),
        sa.Column('tokens_per_sec', sa.Float(), nullable=True),
        sa.Column('cost_usd', sa.Float(), nullable=True),
        sa.Column('is_cache_hit', sa.Boolean(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('finish_reason', sa.String(length=100), nullable=True),
        sa.Column('is_regenerated', sa.Boolean(), nullable=True),
        sa.Column('eval_status', sa.String(length=50), nullable=True),
        sa.Column('eval_groundedness', sa.Float(), nullable=True),
        sa.Column('eval_relevance', sa.Float(), nullable=True),
        sa.Column('feedback_score', sa.Integer(), nullable=True),
        sa.Column('feedback_notes', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_traces_run_id'), 'agent_traces', ['run_id'], unique=False)
    op.create_index(op.f('ix_agent_traces_parent_run_id'), 'agent_traces', ['parent_run_id'], unique=False)
    op.create_index(op.f('ix_agent_traces_session_id'), 'agent_traces', ['session_id'], unique=False)
    op.create_index(op.f('ix_agent_traces_user_id'), 'agent_traces', ['user_id'], unique=False)
    op.create_index(op.f('ix_agent_traces_tenant_id'), 'agent_traces', ['tenant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_agent_traces_tenant_id'), table_name='agent_traces')
    op.drop_index(op.f('ix_agent_traces_user_id'), table_name='agent_traces')
    op.drop_index(op.f('ix_agent_traces_session_id'), table_name='agent_traces')
    op.drop_index(op.f('ix_agent_traces_parent_run_id'), table_name='agent_traces')
    op.drop_index(op.f('ix_agent_traces_run_id'), table_name='agent_traces')
    op.drop_table('agent_traces')
