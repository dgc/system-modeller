/////////////////////////////////////////////////////////////////////////
//
// © University of Southampton IT Innovation Centre, 2023
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
//      Created By:             Panos Melas
//      Created Date:           2023-01-24
//      Created for Project :   Cyberkit4SME
//
/////////////////////////////////////////////////////////////////////////
package uk.ac.soton.itinnovation.security.modelvalidator.attackpath;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bpodgursky.jbool_expressions.And;
import com.bpodgursky.jbool_expressions.Expression;
import com.bpodgursky.jbool_expressions.Or;
import com.bpodgursky.jbool_expressions.Variable;
import com.bpodgursky.jbool_expressions.rules.RuleSet;

public class LogicalExpression {
    private static final Logger logger = LoggerFactory.getLogger(LogicalExpression.class);

    private static int instanceCount = 0; // Static counter variable

    private boolean allRequired;

    private List<Expression<String>> allCauses = new ArrayList<>();
    private Expression<String> cause;

    public LogicalExpression(List<Object> cList, boolean ar) {

        instanceCount++;

        this.allRequired = ar;

        for (Object causeObj : cList) {
            if (causeObj instanceof LogicalExpression) {
                LogicalExpression leObj = (LogicalExpression) causeObj;
                if (leObj.getCause() != null) {
                    allCauses.add(leObj.getCause());
                }
            } else {
                Expression exprObj = (Expression) causeObj;
                if (exprObj != null) {
                    allCauses.add(exprObj);
                }
            }
        }

        if (allCauses.size() == 0) {
            this.cause = null;
        } else if (allCauses.size() == 1) {
            this.cause = allCauses.get(0);
        } else {
            if (allRequired) {
                Expression ands = And.of(allCauses);
                this.cause = RuleSet.simplify(ands);
            } else {
                Expression ors = Or.of(allCauses);
                this.cause = RuleSet.simplify(ors);
            }
        }
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("LE{{");
        Set<String> uris = this.uris();
        Iterator<String> it = uris.iterator();
        while (it.hasNext()) {
            sb.append(it.next());
            if (it.hasNext()) {
                sb.append(", ");
            }
        }
        sb.append("}}");
        return sb.toString();
    }

    public void setCause(Expression expr) {
        this.cause = expr;
    }

    public Expression getCause() {
        if (this.cause == null) {
            return this.cause;
        } else {
            return RuleSet.simplify(this.cause);
        }
    }

    /**
     * Apply DNF to logical expression
     * @param maxComplexity
     */
    public void applyDNF(int maxComplexity) {
        // apply DNF
        if (this.cause == null) {
            return;
        }
        //TODO throw an exception if complexity is too high
        // and caclulate complexity correctly.
        int causeComplexity = this.cause.getChildren().size();
        if (causeComplexity <= maxComplexity) {
            this.cause = RuleSet.toDNF(RuleSet.simplify(this.cause));
        }
    }

    public Set<String> uris() {
        Set<String> symbolSetUris = new HashSet<>();
        if (this.cause != null) {
            for (Expression<String> symbol : this.cause.getChildren()) {
                symbolSetUris.add(symbol.toString());
            }
            if (symbolSetUris.isEmpty()) {
                logger.debug("EMPTY URI");
                symbolSetUris.add(this.cause.toString());
            }
        }
        return symbolSetUris;
    }


    /**
     * Get list of OR terms
     * @return
     */
    public List<Expression> getListFromOr() {
        List<Expression> retVal = new ArrayList<>();
        if (this.cause == null) {
            logger.warn("Logical Expression cause is none");
        } else if (this.cause instanceof Or) {
            for (Expression expr : this.cause.getChildren()) {
                retVal.add(expr);
            }
        } else if (this.cause instanceof And) {
            logger.warn("Logical Expression cause is And when Or was expected");
            retVal.add(this.cause);
        } else {
            logger.warn("Logical Expression operator not supported: {}", this.cause);
        }

        return retVal;
    }

    /**
     * Extract AND terms from logical expression
     * @param expression
     * @return
     */
    public static List<Variable> getListFromAnd(Expression expression) {
        List<Variable> retVal = new ArrayList<>();

        if (expression instanceof And) {
            for (Object obj : expression.getChildren()) {
                retVal.add((Variable)obj);
            }
        } else if (expression instanceof Variable) {
            retVal.add((Variable)expression);
        } else {
            logger.warn("Logical Expression operator not supported: {}", expression);
        }
        return retVal;
    }

    /**
     * Display logical expression in terms of Variables
     */
    public void displayExpression() {
        logger.debug("CSG LogicalExpression has the following terms:");
        parse(this.cause, 0);
    }

    /**
     * Parse Expression terms
     * @param expression
     * @param depth 
     */
    private void parse(Expression<String> expression, int depth) {
        StringBuilder indent = new StringBuilder();
        for (int i = 0; i < depth; i++) {
            indent.append("   ");
        }

        if (expression instanceof And) {
            // Handle the 'And' expression
            And<String> andExpression = (And<String>) expression;
            logger.debug("{} AND(#{}", indent.toString(), andExpression.getChildren().size());
            for (Expression<String> subExpr : andExpression.getChildren()) {
                parse(subExpr, depth + 1);  // Recursive call
            }
            logger.debug("{} )", indent);
        } else if (expression instanceof Or) {
            // Handle the 'Or' expression
            Or<String> orExpression = (Or<String>) expression;
            logger.debug("{} OR(#{}", indent, orExpression.getChildren().size());
            for (Expression<String> subExpr : orExpression.getChildren()) {
                parse(subExpr, depth + 1);  // Recursive call
            }
            logger.debug("{} )", indent);
        } else if (expression instanceof Variable) {
            // Handle the 'Variable' expression
            Variable<String> variableExpression = (Variable<String>) expression;
            // Display the variable, e.g., print it
            logger.debug("{} {}", indent, variableExpression.getValue().substring(11));
        } else {
            // Handle other types of expressions if any, we should not reach
            // here!!!
            logger.warn("LE PARSER: unkown expression {}", expression);
        }
    }
}
