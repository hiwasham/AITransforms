#!/usr/bin/env python3
"""Full Stage3 API client with high-level methods for cores, activities, KPIs, SOPs, Blueprints.

Built on top of stage3_client.Session (the low-level transport).
"""
from stage3_client import Session


class Stage3:
    """High-level Stage3 API client."""

    @staticmethod
    def for_business(slug):
        """Factory method (ignored — only one business supported)."""
        return Stage3()

    def __init__(self):
        self._s = Session()

    def login(self):
        return self._s.login()

    # ---- Cores ----
    def cores(self, proc_id):
        """List cores for a process."""
        d = self._s.inertia(f"/business-processes/{proc_id}/cores")
        return d.get("props", {}).get("cores", [])

    # ---- Activities ----
    def activities(self, proc_id, core_id):
        """List activities for a core."""
        d = self._s.inertia(f"/business-processes/{proc_id}/cores/{core_id}/activities")
        return d.get("props", {}).get("activities", [])

    def activity_update(self, proc_id, core_id, activity_id, name, category=None):
        """Update activity name and/or category. Category auto-creates if new."""
        data = {"name": name}
        if category is not None:
            data["category"] = category

        st, body = self._s.json(
            f"/business-processes/{proc_id}/cores/{core_id}/activities/{activity_id}",
            method="PUT",
            data=data
        )

        if st == 302:  # Success redirect
            # Re-read to get the updated activity with category_id
            acts = self.activities(proc_id, core_id)
            return next((a for a in acts if a["id"] == activity_id), {})

        raise RuntimeError(f"activity_update failed: {st} {body[:200]}")

    # ---- Blueprint ----
    def blueprint_create(self, category_id, title):
        """Create Blueprint content for a category. Returns content_id."""
        st, body = self._s.json(
            f"/content/blueprint/category/{category_id}",
            method="POST",
            data={"title": title}
        )

        if st == 302:  # Success
            # Extract content_id from redirect location
            # Laravel redirects to /content/blueprint/{content_id}
            # Parse from response or re-read
            return self._extract_content_id_from_category(category_id)

        raise RuntimeError(f"blueprint_create failed: {st} {body[:200]}")

    def _extract_content_id_from_category(self, category_id):
        """Helper: find content_id by reading category's blueprint list."""
        # Blueprints are attached to categories, need to find via activity page
        # For now, return a placeholder — caller will need to handle
        # TODO: implement proper content_id extraction
        return None

    def blueprint_versions(self, proc_id, category_id, content_id):
        """Get Blueprint versions."""
        # Blueprint content is accessed via category
        st, body = self._s.json(
            f"/content/blueprint/{content_id}/versions",
            method="GET"
        )

        if st == 200:
            import json
            return json.loads(body)

        return []

    def blueprint_save(self, proc_id, category_id, content_id, version_id, content):
        """Save Blueprint content."""
        st, body = self._s.json(
            f"/content/blueprint/{content_id}/versions/{version_id}",
            method="PUT",
            data={"content": content}
        )

        if st not in (200, 302):
            raise RuntimeError(f"blueprint_save failed: {st} {body[:200]}")

    def blueprint_commit(self, content_id):
        """Commit Blueprint to published status."""
        st, body = self._s.json(
            f"/content/blueprint/{content_id}/status",
            method="POST",
            data={"status": "published"}
        )

        if st not in (200, 302):
            raise RuntimeError(f"blueprint_commit failed: {st} {body[:200]}")

    def blueprint_content(self, proc_id, category_id):
        """Read published Blueprint content for a category."""
        # Need to find content_id first, then read
        # Simplified: try to inertia the activity page and extract blueprint data
        d = self._s.inertia(f"/business-processes/{proc_id}/cores")
        # TODO: proper blueprint content extraction
        return {}
