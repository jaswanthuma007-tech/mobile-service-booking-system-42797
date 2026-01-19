#!/bin/bash
cd /home/kavia/workspace/code-generation/mobile-service-booking-system-42797/service_booking_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

