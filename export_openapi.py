import json
import os
import sys

def export_spec(service_dir, out_file):
    sys.path.insert(0, os.path.abspath(service_dir))
    from src.main import app
    schema = app.openapi()
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w") as f:
        json.dump(schema, f, indent=2)
    sys.path.pop(0)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "backend":
        export_spec("services/backend", "docs/openapi/api-spec.json")
    else:
        # Default export
        export_spec("services/backend", "docs/openapi/api-spec.json")
