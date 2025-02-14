/////////////////////////////////////////////////////////////////////////
//
// © University of Southampton IT Innovation Centre, 2024
//
// Copyright in this software belongs to University of Southampton
// IT Innovation Centre of Gamma House, Enterprise Road,
// Chilworth Science Park, Southampton, SO16 7NS, UK.
//
// This software may not be used, sold, licensed, transferred, copied
// or reproduced in whole or in part in any manner or form or in or
// on any media by any person other than in accordance with the terms
// of the Licence Agreement supplied with the software, or otherwise
// without the prior written consent of the copyright owners.
//
// This software is distributed WITHOUT ANY WARRANTY, without even the
// implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
// PURPOSE, except where stated in the Licence Agreement supplied with
// the software.
//
//      Created By :            Ken Meacham
//      Created Date :          05/02/2024
//      Created for Project :   Cyberkit4SME
//
/////////////////////////////////////////////////////////////////////////
package uk.ac.soton.itinnovation.security.systemmodeller.rest.exceptions;

import java.util.Arrays;

import uk.ac.soton.itinnovation.security.model.system.RiskCalculationMode;

/**
 * BAD_REQUEST error indicating invalid riskMode
 * Will present as an HTTP response.
 */

public class BadRiskModeException extends BadRequestErrorException {
    public BadRiskModeException(String riskMode) {
        super(createMessage(riskMode));
    }

    private static String createMessage(String riskMode) {
        return(String.format("Invalid 'riskMode' parameter value: %s. Valid values are: %s", 
            riskMode, Arrays.toString(RiskCalculationMode.values())));
    }
}
