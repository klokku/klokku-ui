![Klokku Logo](https://klokku.com/klokku-github-banner.png)

# Klokku - track your time and balance your life

Klokku is an application designed to help you achieve a balanced lifestyle by optimizing daily routines and tracking time usage.
You can easily create and adjust time budgets for task groups and enable a structured approach to planning.
You can update your plan weekly, which gives you flexibility and ensures the plan remains realistic and aligned with your life’s demands.

Klokku provides a tool to monitor time allocation, offering insights into how time is spent and helping users make informed adjustments for continuous improvement. 

Read more on [klokku.com](https://klokku.com).


## Installation

Klokku application consists of two main components:
- [backend written in Go](https://github.com/klokku/klokku),
- frontend written in React (this repository).

You can find installation instruction in [the backend repository](https://github.com/klokku/klokku) and in the documentation on [the official website](https://klokku.com).

## Dashboard customization

Use the **Customize dashboard** icon in the Dashboard header to show, hide, and reorder dashboard cards for the current profile.
Tracking now always remains visible and first.
Changes sync across devices after **Save**; **Cancel** discards edits, and **Restore defaults** resets visibility and ordering when saved.

This feature requires backend support for `GET`, `PUT`, and `DELETE /api/user/current/dashboard` and the dashboard configuration database migration.
Deploy the backend before the frontend.
The frontend retains tracking controls and offers a retry if loading dashboard preferences fails.
