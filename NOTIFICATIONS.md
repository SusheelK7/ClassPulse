# Notification Feature Documentation

## Overview
ClassPulse now includes an interactive popup notification system that alerts students **10 minutes before their classes start**. Users can dismiss notifications or snooze them for 5 minutes with a beautiful, intuitive UI.

## How It Works

### Notification Popup
When a class is starting within the notification window:
1. ✅ A beautiful popup appears in the bottom-right corner
2. 🔔 A notification sound plays automatically
3. 📢 Shows class name, time, room, and instructor
4. ⏱️ Auto-dismisses after 30 seconds
5. 🎯 User can interact with it before auto-dismiss

### User Actions
- **OK Button** - Dismiss the notification
- **Remind me in 5 mins Button** - Snooze and show notification again in 5 minutes
- **Auto-dismiss** - Notification closes after 30 seconds with progress bar

### Frontend Architecture
1. **NotificationPopup Component** (`NotificationPopup.jsx`)
   - Beautiful, animated popup UI
   - Progress bar showing auto-dismiss countdown
   - Shows class details (room, instructor, time)

2. **NotificationQueueContext** (`NotificationQueueContext.jsx`)
   - Manages notification queue
   - Handles dismiss, snooze logic
   - Supports multiple notifications in queue

3. **useNotification Hook** (`useNotification.js`)
   - Checks every 60 seconds for upcoming classes
   - Triggers notification 10 minutes before class
   - Plays sound alert
   - Prevents duplicate notifications

### Backend
- User model updated with notification preferences
- Auth routes return notification settings
- Profile endpoint supports saving preferences

## Features

✅ **Beautiful Animated Popup** - Modern, gradient design
✅ **Sound Alert** - Beeping notification sound (8 seconds after popup)
✅ **Snooze Functionality** - Remind me in 5 minutes
✅ **Auto-dismiss** - Closes after 30 seconds
✅ **Progress Bar** - Visual countdown to auto-dismiss
✅ **Class Details** - Shows room, instructor, time
✅ **Customizable Timing** - Choose 5-30 minutes before class
✅ **Dark/Light Mode** - Works in any theme
✅ **Queue System** - Handles multiple notifications

## UI/UX Details

### Popup Design
- **Position**: Bottom-right corner (fixed)
- **Size**: Max 420px width (responsive)
- **Animation**: Slides in from right with 300ms duration
- **Colors**: Gradient primary color with theme support
- **Shadows**: Modern shadow effects for depth

### Interactive Elements
- **OK Button**: Gray background, returns to normal state
- **Remind Button**: Primary gradient, with shadow effect
- **Progress Bar**: Gradient from primary-500 to primary-600
- **Icons**: Animated bell icon with pulsing effect

### Responsive Behavior
- Works on mobile and desktop
- Touch-friendly button sizes (44px minimum)
- Auto-hides behind content when needed
- Respects system dark mode

## Usage

### For Users

1. **Receiving Notifications**
   - When enabled, notifications appear automatically
   - Sound plays to catch attention
   - Popup shows for 30 seconds

2. **Dismissing**
   - Click "OK" button to dismiss
   - Click X to dismiss
   - Wait 30 seconds for auto-dismiss

3. **Snoozing**
   - Click "Remind me in 5 mins"
   - Notification will show again in 5 minutes
   - Great if you're not ready yet

4. **Customizing**
   - Go to settings to change notification timing
   - Choose 5, 10, 15, 20, or 30 minutes
   - Toggle notifications on/off

### For Developers

#### Showing a Notification Programmatically
```jsx
import { useNotificationQueue } from '../context/NotificationQueueContext';

function MyComponent() {
  const { showNotification } = useNotificationQueue();

  const handleNotify = () => {
    showNotification({
      subject: 'Mathematics Class',
      room: 'Room 101',
      teacher: 'Dr. Smith',
      minutesUntil: 10,
      startTime: '14:00',
      endTime: '15:00',
      classId: 'class123',
    });
  };

  return <button onClick={handleNotify}>Show Notification</button>;
}
```

#### Using the Notification Hook
```jsx
import { useNotification } from '../hooks/useNotification';

export default function Dashboard() {
  const classes = [...];
  
  // Automatically shows notifications for upcoming classes
  useNotification(classes);
  
  return <div>...</div>;
}
```

## Technical Details

### File Structure
```
frontend/
├── components/
│   └── NotificationPopup.jsx          # Popup UI component
├── context/
│   ├── NotificationContext.jsx        # Settings context
│   └── NotificationQueueContext.jsx   # Queue management
├── hooks/
│   └── useNotification.js             # Notification logic
└── pages/
    └── Dashboard.jsx                  # Integration point

backend/
├── models/
│   └── User.js                        # Notification fields
└── routes/
    └── auth.js                        # Preference endpoints
```

### Notification Flow
```
1. Classes loaded in Dashboard
2. useNotification hook checks every 60 seconds
3. When class is 10 minutes away:
   - Sound plays
   - showNotification() called
   - Popup added to queue
4. User can:
   - Click OK → dismiss
   - Click Remind → reschedule in 5 mins
   - Wait 30s → auto-dismiss
```

### Queue Management
- Notifications can be queued
- Only one notification displays at a time
- Additional notifications wait in queue
- Next notification shows after current one is dismissed

## Browser Compatibility

| Browser | Popup | Sound | Storage |
|---------|-------|-------|---------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Mobile | ⚠️ | ⚠️ | ✅ |

## Customization

### Changing Snooze Duration
Edit `Dashboard.jsx`:
```jsx
onRemindLater={() => remindLater(currentNotification, 600000)} // 10 minutes
```

### Changing Auto-dismiss Time
Edit `NotificationPopup.jsx`:
```jsx
const dismissTimer = setTimeout(() => onDismiss(), 60000); // 60 seconds
```

### Styling the Popup
All styles in `NotificationPopup.jsx` use TailwindCSS classes. Modify:
- Colors: Change gradient classes
- Animations: Modify animation duration
- Size: Change max-w-sm and width values
- Position: Change fixed positioning

## Troubleshooting

### Notifications Not Showing
1. Check if notifications are enabled in Dashboard
2. Check browser console for errors
3. Verify classes have correct day and time
4. Ensure currentNotification state is working

### Snooze Not Working
1. Check browser console for errors
2. Verify NotificationQueueProvider is in provider hierarchy
3. Check setTimeout is working

### Sound Not Playing
1. Check system volume
2. Verify Web Audio API is supported
3. Try different browser
4. Check autoplay policies

### Styling Issues
1. Clear browser cache
2. Restart dev server
3. Check TailwindCSS is generating classes
4. Verify dark mode is configured

## Future Enhancements
- [ ] Custom snooze durations
- [ ] Notification history
- [ ] Multiple simultaneous popups
- [ ] Assignment reminder notifications
- [ ] Deadline warning notifications
- [ ] Persistent notification database
- [ ] Email notification fallback
- [ ] Analytics on notification interactions

## API Reference

### useNotificationQueue()
```javascript
const {
  currentNotification,      // Current showing notification
  queue,                    // Queue of pending notifications
  showNotification,         // Show new notification
  dismissNotification,      // Dismiss by ID
  dismissCurrentNotification, // Dismiss current
  remindLater,             // Snooze notification
} = useNotificationQueue();
```

### useNotification(classes)
Automatically monitors classes and shows notifications 10 minutes before start.

### NotificationPopup Props
```javascript
<NotificationPopup
  notification={{          // Notification object
    subject: string,
    room: string,
    teacher: string,
    minutesUntil: number,
    startTime: string,
    endTime: string,
    classId: string,
  }}
  onDismiss={() => {}}     // Callback on dismiss
  onRemindLater={() => {}} // Callback on snooze
/>
```

## Dependencies
- **Web Audio API** - For notification sound
- **React Context API** - For state management
- **TailwindCSS** - For styling
- **React Router** - For page routing
- **Lucide React** - For icons

---

**Version**: 2.0 (Popup Notifications)
**Last Updated**: May 15, 2026

